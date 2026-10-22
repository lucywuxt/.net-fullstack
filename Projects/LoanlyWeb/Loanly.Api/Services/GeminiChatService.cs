using System.Text;
using System.Text.Json;
using Loanly.Api.Data;
using Loanly.Api.Dtos;

namespace Loanly.Api.Services;

public partial class GeminiChatService
{
    private readonly HttpClient _httpClient;
    private readonly LoanlyDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<GeminiChatService> _logger;

    public const string SystemInstructionPrompt = """
You are the "Loanly Client Connection Operations Assistant" for loanly.wiki, modeled on World Bank Investment Project Financing (IPF) and WFACS disbursement operations.
STRICT SCOPE RULES:
1. You ONLY answer questions related to:
   - World Bank project financing lifecycle (Concept -> Appraisal -> Negotiation -> BoardApproval -> Active -> Closed)
   - Financing instruments: IBRD Loan vs. IDA Credit vs. IDA Grant
   - Withdrawal Applications & Expenditure Categories (Works, Goods, ConsultingServices, Training, OperatingCosts) and documentation requirements (IPC, SOE, IFR, STEP).
   - The logged-in user's live Projects, undisbursed balances, Withdrawal Application statuses, Disbursements, and Results Indicators provided in LIVE SESSION CONTEXT.
2. If a user asks about unrelated topics (recipes, sports, weather, jokes, general chit-chat), politely decline and redirect them to World Bank project financing or their active portfolio.
3. Cite exact project codes, WA numbers, and dollar figures from the LIVE SESSION CONTEXT.
""";

    public GeminiChatService(
        HttpClient httpClient,
        LoanlyDbContext db,
        IConfiguration config,
        ILogger<GeminiChatService> logger)
    {
        _httpClient = httpClient;
        _db = db;
        _config = config;
        _logger = logger;
    }

    public async Task<ChatResponseDto> SendChatMessageAsync(
        string userType,
        int userId,
        ChatRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            throw new ServiceValidationException("Chat message cannot be empty.");

        var (contextBlock, contextSummary) = await BuildLiveContextAsync(
            userType, userId, request.SelectedProjectId, request.SelectedWithdrawalId);

        var apiKey = _config["Gemini:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        var model = _config["Gemini:Model"] ?? "gemini-3.6-flash";

        if (!string.IsNullOrWhiteSpace(apiKey) && !apiKey.StartsWith("YOUR_", StringComparison.OrdinalIgnoreCase))
        {
            var liveReply = await TryCallGeminiApiAsync(apiKey, model, request, contextBlock);
            if (!string.IsNullOrWhiteSpace(liveReply))
            {
                return new ChatResponseDto(liveReply, model, BuildSuggestedFollowUps(userType), contextSummary);
            }
        }

        var contextualReply = await GenerateContextualOperationsReplyAsync(userType, userId, request.Message, contextBlock);
        return new ChatResponseDto(contextualReply, $"{model} (Operations Engine)", BuildSuggestedFollowUps(userType), contextSummary);
    }

    private async Task<string?> TryCallGeminiApiAsync(string apiKey, string model, ChatRequestDto request, string contextBlock)
    {
        foreach (var candidateModel in new[] { model, "gemini-2.5-flash" }.Distinct())
        {
            try
            {
                var endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{candidateModel}:generateContent?key={Uri.EscapeDataString(apiKey)}";
                var fullUserPrompt = $"LIVE SESSION CONTEXT:\n{contextBlock}\n\nUSER QUESTION:\n{request.Message}";
                var payload = new
                {
                    system_instruction = new { parts = new[] { new { text = SystemInstructionPrompt } } },
                    contents = new[] { new { role = "user", parts = new[] { new { text = fullUserPrompt } } } },
                    generationConfig = new { temperature = 0.25, maxOutputTokens = 700 }
                };

                using var httpContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                using var response = await _httpClient.PostAsync(endpoint, httpContent);
                if (!response.IsSuccessStatusCode) continue;

                using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
                if (doc.RootElement.TryGetProperty("candidates", out var cands) && cands.GetArrayLength() > 0 &&
                    cands[0].TryGetProperty("content", out var content) &&
                    content.TryGetProperty("parts", out var parts) && parts.GetArrayLength() > 0 &&
                    parts[0].TryGetProperty("text", out var textProp))
                {
                    return textProp.GetString();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gemini API call failed for model {Model}", candidateModel);
            }
        }
        return null;
    }

    private static List<string> BuildSuggestedFollowUps(string userType) =>
        userType == "Country"
            ? new List<string>
            {
                "What's the status of my latest withdrawal application?",
                "Which expenditure category does consultant travel fall under?",
                "How much undisbursed balance remains on my active projects?",
                "What is the difference between an IBRD Loan, IDA Credit, and IDA Grant?"
            }
            : new List<string>
            {
                "Which Withdrawal Applications are currently awaiting review or disbursement?",
                "What supporting documents are required for Works vs. Goods categories?",
                "Summarize our active portfolio commitments and remaining undisbursed ceiling.",
                "When can a project transition from BoardApproval to Active or Closed?"
            };
}
