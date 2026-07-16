using System;
using System.Collections.Generic;

namespace CSSHotel.Utility.Service
{

    public static class SurveyEmailTemplates
    {
        private static readonly Dictionary<string, (string Subject, string Body)> _templates =
            new(StringComparer.OrdinalIgnoreCase)
        {
            ["en"] = (
                "Parador Beach Guest Survey",
                "<h1>Thanks for choosing our hotel! It has been a pleasure to have you here.</h1>" +
                "<p>We would be happy if you could take a moment to complete our guest satisfaction survey so we can serve you even better next time. Thank you :)</p>"
            ),
            ["tr"] = (
                "Parador Beach Misafir Anketi",
                "<h1>Otelimizi tercih ettiğiniz için teşekkür ederiz! Sizi burada ağırlamak bizim için bir zevkti.</h1>" +
                "<p>Bir sonraki konaklamanızda size daha iyi hizmet verebilmemiz için misafir memnuniyeti anketimizi doldurmaya birkaç dakikanızı ayırırsanız çok memnun oluruz. Teşekkürler :)</p>"
            ),
            ["ru"] = (
                "Опрос гостей Parador Beach",
                "<h1>Спасибо, что выбрали наш отель! Нам было очень приятно принимать вас.</h1>" +
                "<p>Будем рады, если вы уделите несколько минут нашему опросу удовлетворённости гостей, чтобы в следующий раз мы могли обслужить вас ещё лучше. Спасибо :)</p>"
            ),
            ["de"] = (
                "Parador Beach Gästeumfrage",
                "<h1>Vielen Dank, dass Sie unser Hotel gewählt haben! Es war uns eine Freude, Sie bei uns begrüßen zu dürfen.</h1>" +
                "<p>Wir würden uns freuen, wenn Sie sich einen Moment Zeit nehmen, um unsere Gästezufriedenheitsumfrage auszufüllen, damit wir Sie beim nächsten Mal noch besser betreuen können. Danke :)</p>"
            ),
            ["da"] = (
                "Parador Beach Gæsteundersøgelse",
                "<h1>Tak fordi du valgte vores hotel! Det har været en fornøjelse at have dig her.</h1>" +
                "<p>Vi vil blive glade, hvis du vil tage et øjeblik til at udfylde vores gæstetilfredshedsundersøgelse, så vi kan betjene dig endnu bedre næste gang. Tak :)</p>"
            ),
            ["pl"] = (
                "Ankieta dla gości Parador Beach",
                "<h1>Dziękujemy za wybór naszego hotelu! Gościć Państwa było dla nas prawdziwą przyjemnością.</h1>" +
                "<p>Będziemy wdzięczni, jeśli poświęcą Państwo chwilę na wypełnienie naszej ankiety satysfakcji gości, abyśmy następnym razem mogli obsłużyć Państwa jeszcze lepiej. Dziękujemy :)</p>"
            ),
        };

        ///Returns the template for the given language code, or the English one if unknown.</summary>
        public static (string Subject, string Body) Get(string lang)
        {
            if (!string.IsNullOrWhiteSpace(lang) && _templates.TryGetValue(lang, out var template))
            {
                return template;
            }
            return _templates["en"];
        }
    }
}
