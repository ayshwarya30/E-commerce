@echo off
set JAVA_HOME=C:\Users\deepa\scoop\apps\openjdk17\current
set PATH=%JAVA_HOME%\bin;C:\Users\deepa\scoop\apps\maven\current\bin;C:\Users\deepa\scoop\shims;%PATH%
cd /d d:\E-commerce\backend
echo Starting backend on http://localhost:8080
"C:\Users\deepa\scoop\apps\maven\current\bin\mvn.cmd" spring-boot:run
