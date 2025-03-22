FROM maven:3.8.7-eclipse-temurin-17-focal

WORKDIR /app

# Sao chép file cấu hình của Maven
COPY pom.xml .

# Tải trước các dependency
RUN mvn dependency:go-offline -B

# Sao chép mã nguồn
COPY src ./src

# Biên dịch ứng dụng trong container với volume mount cho .m2
CMD ["mvn", "spring-boot:run"]