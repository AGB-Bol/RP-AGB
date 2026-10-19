# Etapa 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY . .
RUN dotnet restore "RPAGB.Api/RPAGB.Api.csproj"
RUN dotnet publish "RPAGB.Api/RPAGB.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Etapa 2: Runtime (Imagen ligera Alpine)
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "RPAGB.Api.dll"]