using Microsoft.AspNetCore.SignalR;

namespace HotelCSS.Hubs
{
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            // Check the user's role from their JWT Token
            if (Context.User.IsInRole("Admin") || Context.User.IsInRole("Reception") || Context.User.IsInRole("Kitchen") || Context.User.IsInRole("Technic") || Context.User.IsInRole("Manager"))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "StaffGroup");
            }
            await base.OnConnectedAsync();
        }
    }
}
