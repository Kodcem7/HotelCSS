using CSSHotel.DataAccess.Repository.IRepository;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace HotelCSS.BackgroundServices
{
    public class EventStatusWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        // Inject the scope factory
        public EventStatusWorker(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // This loop runs continuously as long as your web API is running
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // 1. Create a fresh scope to safely access the database
                    using (var scope = _scopeFactory.CreateScope())
                    {
                        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                        var now = DateTime.Now;
                        bool changesMade = false;

                        // 2. TURN OFF expired events
                        // Find events that are currently Active, but their EndDate has passed.
                        var expiredEvents = unitOfWork.HotelEvent
                            .GetAll(e => e.IsActive == true && e.EndDate != null && e.EndDate < now)
                            .ToList();

                        if (expiredEvents.Any())
                        {
                            foreach (var ev in expiredEvents)
                            {
                                ev.IsActive = false; // Turn it off!
                                unitOfWork.HotelEvent.Update(ev);
                            }

                            Console.WriteLine($"[Worker] Deactivated {expiredEvents.Count} expired events at {now}");
                            changesMade = true;
                        }

                        // 2.5 TURN OFF premature/future events
                        // Find events that are currently Active, but their StartDate hasn't arrived yet.
                        var prematureEvents = unitOfWork.HotelEvent
                            .GetAll(e => e.IsActive == true && e.StartDate != null && e.StartDate > now)
                            .ToList();

                        if (prematureEvents.Any())
                        {
                            foreach (var ev in prematureEvents)
                            {
                                ev.IsActive = false; // Turn it off until it starts!
                                unitOfWork.HotelEvent.Update(ev);
                            }

                            Console.WriteLine($"[Worker] Deactivated {prematureEvents.Count} future events that haven't started yet.");
                            changesMade = true;
                        }

                        // 3. TURN ON scheduled events that have just started
                        // Find events that are Inactive, but their StartDate has arrived (and they haven't expired yet).
                        var startingEvents = unitOfWork.HotelEvent
                            .GetAll(e => e.IsActive == false &&
                                         e.StartDate != null && e.StartDate <= now &&
                                         (e.EndDate == null || e.EndDate > now))
                            .ToList();

                        if (startingEvents.Any())
                        {
                            foreach (var ev in startingEvents)
                            {
                                ev.IsActive = true; // Turn it on!
                                unitOfWork.HotelEvent.Update(ev);
                            }

                            Console.WriteLine($"[Worker] Activated {startingEvents.Count} scheduled events at {now}");
                            changesMade = true;
                        }

                        // 4. Save all changes to the database at once, only if we actually flipped switches
                        if (changesMade)
                        {
                            unitOfWork.Save();
                        }
                    }
                }
                catch (Exception ex)
                {
                    // Catch errors so a database blip doesn't crash your whole server
                    Console.WriteLine($"[Worker] Error: {ex.Message}");
                }

                // 5. Put the worker to sleep for 60 seconds before checking the database again.
                await Task.Delay(TimeSpan.FromSeconds(60), stoppingToken);
            }
        }
    }
}