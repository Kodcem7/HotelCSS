using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CSSHotel.Models
{
    // Represents one "round" of a survey: every time the survey is activated a new
    // cycle is opened (StartedAt), and deactivating it closes the cycle (EndedAt).
    // Responses are tied to the cycle that was open when they were submitted, so the
    // same room can answer the same survey again in each new weekly cycle.
    public class SurveyCycle
    {
        [Key]
        public int Id { get; set; }

        public int SurveyId { get; set; }
        public Survey Survey { get; set; }

        // When the survey was activated for this round.
        public DateTime StartedAt { get; set; } = DateTime.Now;

        // When it was deactivated. Null while the cycle is still open/active.
        public DateTime? EndedAt { get; set; }

        public ICollection<SurveyResponse> Responses { get; set; }
    }
}
