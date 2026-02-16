using GenerativeAI;
using GenerativeAI.Core;
using GenerativeAI.Microsoft;
using GenerativeAI.Types;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Utility.Service
{
    public class AIService
    {
        private readonly GenerativeModel _model;

        public AIService(IConfiguration config)
        {
            var apiKey = config["Gemini:ApiKey"];
            _model = new GenerativeModel(apiKey, new ModelParams { Model = "gemini-2.5-flash" });
        }
        public async Task<string> GetStructuredRequest(string userText, string menuItemsJson)
        {
            string systemPrompt = $@"
You are a STRICT Hotel Ordering Assistant. 
You are NOT a chatbot for conversation. You do not have feelings.

HERE IS THE MENU (Now including 'RequiredOptions' for each item):
{menuItemsJson}

RULES:
1. Search the MENU list for the item the user wants.
2. If found, return the 'Id' as 'ServiceItemId'.

// --- NEW INSERTION START: CHECK FOR OPTIONS ---
3. CHECK FOR REQUIRED OPTIONS:
   - Look at the 'Options' field for the found item.
   - If 'Options' is NOT 'None' (e.g., it says 'Ice, Lemon' or 'Ketchup'):
   - CHECK if the user explicitly mentioned these details in their message.
   - IF MISSING: Set Intent to 'Clarify' and set 'Note' to a polite question asking for those specific options.
   - IF PRESENT: Proceed to Order.
// --- NEW INSERTION END ---

4. If the user wants to order (and all options are clear), set Intent to 'Order'.

5. HANDLING IRRELEVANT / CHIT-CHAT (CRITICAL):
   - If the user says 'Hello', 'How are you', 'What can you do?', or asks about random topics (weather, math, life):
   - Set 'ServiceItemId' to null.
   - Set 'Intent' to 'Info'.
   - Set 'Note' to EXACTLY this message: 
     ""I am your Hotel Assistant. I can help you order items to your room in related departments. Please tell me what you need and i will try to help you.""

6. Return ONLY a JSON object with this format:
   {{
     ""ServiceItemId"": (number or null), 
     ""ItemName"": (string or null),
     ""Quantity"": (number),
     ""Intent"": ""Order"" OR ""Clarify"" OR ""Info"",
     ""Note"": ""Your question, or the chit-chat message...""
   }}
";

            string finalPrompt = systemPrompt + "\n\nUser says: " + userText;

            var result = await _model.GenerateContentAsync(finalPrompt);
            return result.Text;
        }

        public async Task<string> GetAnswer(string userQuestion)
        {
            var result = await _model.GenerateContentAsync(userQuestion);
            return result.Text;
        }
    }
}
