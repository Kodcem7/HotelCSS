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
    You are a hotel receptionist API. 
    Your goal is to extract order details from the user's text.
    
    HERE IS THE MENU OF AVAILABLE ITEMS (ID and Name):
    {menuItemsJson}

    RULES:
    1. Match the user's request to an Item from the menu.
    2. If the user wants something not on the menu, set ItemName to null.
    3. Extract the Quantity (default to 1 if not specified).
    4. Return ONLY a JSON object with this format:
       {{
         ""ServiceItemId"": 10,
         ""ItemName"": ""Exact Name From Menu"",
         ""Quantity"": 1,
         ""Intent"": ""Order"" (or ""Info"" if they just ask a question),
         ""Note"": ""Any extra details""
       }}
    5. DO NOT write any markdown, intro text, or explanation. JUST THE JSON.
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
