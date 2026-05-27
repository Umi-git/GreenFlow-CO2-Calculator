using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace GreenFlow.API.Controllers;

// DTO for registration data
public class RegisterDto
{
    [Required]
    public string FullName { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    public string Password { get; set; }
}

// DTO for login data
public class LoginDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    public string Password { get; set; }
}


[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterDto registerDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        // TODO: Add user to database here.
        return Ok(new { message = "User registered successfully!" });
    }

    // NEW METHOD ADDED HERE
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDto loginDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // IMPORTANT: This is a placeholder for real authentication logic.
        // For now, we will always return a successful login response
        // so you can test the frontend flow.

        // TODO: Verify user credentials against the database here.

        // Return a fake user object and token that matches what the frontend expects.
        return Ok(new
        {
            token = "fake-jwt-token-for-testing",
            fullName = "Adil", // You can use loginDto.Email or a fixed name
            email = loginDto.Email,
            role = "User" // Can be "User" or "Admin"
        });
    }

    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok("Authentication endpoint is working!");
    }
}