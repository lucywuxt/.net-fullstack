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

var connectionString = builder.Configuration.GetConnectionString("LoanlyDb")
    ?? "Server=localhost,1434;Database=LoanlyDb;User Id=SA;Password=LWxt1234;TrustServerCertificate=True;";

builder.Services.AddDbContext<LoanlyDbContext>(options =>
    options.UseSqlServer(connectionString));

var jwtKey = builder.Configuration["Jwt:Key"] ?? "LoanlySovereignFinancingSuperSecretJwtKey2026_WorldBankClientConnection!";
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
                "https://www.loanly.wiki")
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

