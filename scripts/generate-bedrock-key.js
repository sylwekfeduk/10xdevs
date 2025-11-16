#!/usr/bin/env node

/**
 * Helper script to generate AWS Bedrock API key
 * Converts AWS credentials to a single base64-encoded API key
 */

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("\n🔐 AWS Bedrock API Key Generator\n");
console.log("This script will combine your AWS credentials into a single API key.\n");

let accessKeyId, secretAccessKey, region;

rl.question("Enter your AWS Access Key ID: ", (accessKey) => {
  accessKeyId = accessKey.trim();

  rl.question("Enter your AWS Secret Access Key: ", (secretKey) => {
    secretAccessKey = secretKey.trim();

    rl.question("Enter your AWS Region (default: us-east-1): ", (regionInput) => {
      region = regionInput.trim() || "us-east-1";

      // Combine credentials
      const combined = `${accessKeyId}:${secretAccessKey}:${region}`;

      // Encode to base64
      const apiKey = Buffer.from(combined).toString("base64");

      console.log("\n✅ Your AWS Bedrock API Key:\n");
      console.log(`AWS_BEDROCK_API_KEY=${apiKey}\n`);
      console.log("Copy this to your .env file\n");

      rl.close();
    });
  });
});