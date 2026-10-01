@echo off
echo ========================================================
echo   VCafe Multi-Branch Management System - Local Setup
echo   Author: Vidhya Walke
echo ========================================================

echo 1. Installing dependencies...
call npm run install:all

echo 2. Initializing database and demo seeds...
call npm run seed

echo 3. Building React production client...
call npm run build:client

echo ========================================================
echo   Ready! Starting local development environment...
echo   Backend will run on http://localhost:5000
echo   Frontend will run on http://localhost:3000
echo ========================================================
call npm run server
