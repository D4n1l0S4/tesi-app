FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY . .

RUN chmod +x ./mvnw \
    && ./mvnw clean install -DskipTests

CMD ["java", "-jar", "target/crud-0.0.1-SNAPSHOT.jar"]
