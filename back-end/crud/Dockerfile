FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY . .

# Rendi eseguibile mvnw (fix per Permission denied)
RUN chmod +x mvnw

RUN ./mvnw clean install -DskipTests

CMD ["java", "-jar", "target/*.jar"]
