using System.Text;
using System.Text.Json.Serialization;
using Loanly.Api.Data;
using Loanly.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddOpenApi();
builder.Services.AddMemoryCache();

var connectionString = builder.Configuration.GetConnectionString("LoanlyDb");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Missing ConnectionStrings:LoanlyDb. Set it via appsettings.Development.json locally, " +
        "or the ConnectionStrings__LoanlyDb app setting in Azure.");
}

builder.Services.AddDbContext<LoanlyDbContext>(options =>
    options.UseSqlServer(connectionString, sqlOptions =>
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 6,
            maxRetryDelay: TimeSpan.FromSeconds(15),
            errorNumbersToAdd: null)));

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException(
        "Missing Jwt:Key. Set it via appsettings.Development.json locally, or the Jwt__Key app setting in Azure.");
}
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "loanly.wiki";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "loanly.wiki";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("LoanlyCors", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://loanly.wiki",
                "https://www.loanly.wiki",
                "https://agreeable-field-0f4462f10.4.azurestaticapps.net")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<FinancingService>();
builder.Services.AddHttpClient<WorldBankService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(12);
    client.DefaultRequestHeaders.Add("User-Agent", "Loanly-WorldBank-Portal/1.0 (https://loanly.wiki)");
});
builder.Services.AddHttpClient<GeminiChatService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(20);
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<LoanlyDbContext>();
    await DbSeeder.SeedAsync(db);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("LoanlyCors");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/health", () => Results.Ok(new
{
    status = "healthy",
    service = "Loanly.Api (loanly.wiki)",
    timestamp = DateTime.UtcNow
}));

app.MapControllers();

app.Run();

