# Stage 1: Build the app (CHANGED TO 10.0)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["VoloBackend.csproj", "./"]
RUN dotnet restore "VoloBackend.csproj"
COPY . .
RUN dotnet publish "VoloBackend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Run the app (CHANGED TO 10.0)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "VoloBackend.dll"]