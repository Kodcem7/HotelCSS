# ---- Build stage ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files first for restore-layer caching
COPY ["HotelCSS/HotelCSS.csproj", "HotelCSS/"]
COPY ["CSSHotel.DataAccess/CSSHotel.DataAccess.csproj", "CSSHotel.DataAccess/"]
COPY ["CSSHotel.Models/CSSHotel.Models.csproj", "CSSHotel.Models/"]
COPY ["CSSHotel.Utility/CSSHotel.Utility.csproj", "CSSHotel.Utility/"]
RUN dotnet restore "HotelCSS/HotelCSS.csproj"

# Copy the rest of the source and publish
COPY . .
WORKDIR /src/HotelCSS
RUN dotnet publish "HotelCSS.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ---- Runtime stage ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "HotelCSS.dll"]
