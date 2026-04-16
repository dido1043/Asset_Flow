# Build the Spring Boot app from source so the image always matches the codebase.
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /build

COPY AssetFlowApi/.mvn/ .mvn/
COPY AssetFlowApi/mvnw .
COPY AssetFlowApi/pom.xml .

RUN chmod +x mvnw
RUN ./mvnw -q -DskipTests dependency:go-offline

COPY AssetFlowApi/src ./src
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /build/target/AssetFlowApi-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
