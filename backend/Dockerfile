# Stage 1: Build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["VoloBackend.csproj", "./"]
RUN dotnet restore "VoloBackend.csproj"
COPY . .
RUN dotnet publish "VoloBackend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Run the app
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "VoloBackend.dll"]