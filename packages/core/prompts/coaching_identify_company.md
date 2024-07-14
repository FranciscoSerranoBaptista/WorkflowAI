---
id: identify_company
description: Identify the name of a company given some text
temperature: 0.7
maxTokens: 4096
---
You are tasked with identifying the company name related to a client from the given text. The text you need to analyze is given in the text.

Your task is to carefully read through the provided text and identify any company names that are mentioned as being related to a client. The company name could be explicitly stated as a client's company, or it might be implied through context.

Follow these steps:
1. Read the entire text carefully.
2. Look for any mentions of company names.
3. Determine if the mentioned company is related to a client based on the context.
4. If you find a company name that is clearly related to a client, identify it as the answer.
5. If you find multiple company names that could be related to clients, list all of them.
6. If you don't find any company names related to clients, state that no client company was identified.

Provide your answer in the following format in English:
[Your identified company name(s) or "No client company identified"]

If you're unsure about a company name or its relation to a client, output "No client company identified"
