# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy the project file and restore dependencies
COPY ["VoloBackend.csproj", "./"]
RUN dotnet restore "VoloBackend.csproj"

# Copy the rest of the code and build the project
COPY . .
RUN dotnet publish "VoloBackend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Run the application
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Expose port 8080 (Render's default port for web services)
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# Copy the compiled app from the build stage
COPY --from=build /app/publish .

# Tell Docker how to start the app (Replace 'db-backend.dll' if your .csproj has a different name)
ENTRYPOINT ["dotnet", "VoloBackend.dll"]