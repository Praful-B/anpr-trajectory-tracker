FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

COPY mvnw ./
COPY .mvn .mvn
COPY pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src ./src
RUN ./mvnw clean package -Dmaven.test.skip=true -B

FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=build /app/target/backend-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
