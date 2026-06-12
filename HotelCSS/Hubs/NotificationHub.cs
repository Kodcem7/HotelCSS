using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;

namespace HotelCSS.Hubs
{
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var user = Context.User;

            if (user.IsInRole("Admin") || user.IsInRole("Reception") || user.IsInRole("Kitchen") ||
                user.IsInRole("Technic") || user.IsInRole("Manager") || user.IsInRole("HouseKeeping") ||
                user.IsInRole("Restaurant"))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "StaffGroup");
            }

            if (user.IsInRole("Room"))
            {
                var username = user.Identity?.Name ?? string.Empty;
                var match = Regex.Match(username, @"(\d+)$");
                if (match.Success)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"Room{match.Groups[1].Value}");
                }
            }

            await base.OnConnectedAsync();
        }
    }
}
