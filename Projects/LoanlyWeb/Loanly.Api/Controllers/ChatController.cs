using System.Security.Claims;
using Loanly.Api.Dtos;
using Loanly.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Loanly.Api.Controllers;

[ApiController]
[Route("api/chat")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly GeminiChatService _chatService;

    public ChatController(GeminiChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpPost]
    public async Task<ActionResult<ChatResponseDto>> PostMessage([FromBody] ChatRequestDto request)
    {
        try
        {
            var role = User.FindFirstValue(ClaimTypes.Role) ?? "Country";
            int userId = role == "Admin"
                ? int.Parse(User.FindFirstValue("adminId") ?? "0")
                : int.Parse(User.FindFirstValue("countryId") ?? "0");

            var response = await _chatService.SendChatMessageAsync(role, userId, request);
            return Ok(response);
        }
        catch (ServiceValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
