---
id: linkedin_generate_slugline
description: Generate a slugline for your LinkedIn profile that highlights your unique skills, experiences, and value proposition.
temperature: 0.7
maxTokens: 4096
dependencies:
  - linkedin_company_information
  - linkedin_target_audience
---
You are tasked with creating LinkedIn Slugline suggestions for an individual. A Slugline is a short, impactful message that appears in the banner image of a LinkedIn profile. Your goal is to create compelling Sluglines that resonate with the target audience and effectively represent the company.

First, review the company information:
<company_info>
{{COMPANY_INFO}}
</company_info>

Now, consider the target audience:
<target_audience>
{{TARGET_AUDIENCE}}
</target_audience>

Your task is to generate 10 Slugline suggestions using the following frameworks:

1. Benefit-Focused Framework: [Benefit] + [Result/Outcome]
2. Aspirational Framework: [Mission/Aspiration] + [Future]
3. Emotional Framework: [Emotion] + [Outcome/Result]
4. Action-Oriented Framework: [Action] + [Result/Outcome]

For each suggestion:
1. Create a Slugline using one of the frameworks above.
2. Provide a brief reasoning for why this Slugline would be effective for the target audience and align with the company's goals.
3. Rate the suggestion on a scale of 1-10, with 10 being the most effective.

Present your suggestions in the following markdown table format:

## Slugline Suggestions

| Slugline Framework | Slugline | Reasoning | Rating |
|--------------------|----------|-----------|--------|
| [Framework Name]   | [Your Slugline suggestion here] | [Your reasoning for this suggestion] | [Your rating from 1-10] |

[Continue for the number of suggestions requested]
+++

Ensure that your suggestions are diverse, using different frameworks and appealing to various aspects of the target audience and company goals. Be creative and aim to capture the essence of the company while resonating with the intended audience.

## Slugline Frameworks

### Benefit-Focused Framework

Instead of focusing on features or products, this framework focuses on the benefits that your products or services provide.

Benefit-Focused Framework: [Benefit] + [Result/Outcome]
Example: "Empowering you to live your best life." (Life coach)
Formula: [Empowerment] + [Best life outcome]

Aspirational Framework**: This framework focuses on creating a slug line that inspires and motivates others, highlighting your mission or aspirations for the future. This can be a great way to connect with others who share your values and goals.

Aspirational Framework: [Mission/Aspiration] + [Future]
Example: "Building a world where everyone has access to quality education." (Educational nonprofit)
Formula: [World with access to quality education] + [Future goal]

### Emotional Framework
A slug line that appeals to emotions can be a powerful tool for connecting with customers and building a strong brand. Consider crafting a slug line that resonates with your target audience on an emotional level, highlighting the feelings they can experience when working with you.

Emotional Framework: [Emotion] + [Outcome/Result]
Example: "Bringing joy to your home, one room at a time." (Interior design company)
Formula: [Joy] + [Home design outcome]

### Action-Oriented Framework
An action-oriented slug line emphasizes the specific actions that customers can take to achieve their goals or solve their problems. This can be a great way to motivate and inspire customers to take action and make the most of your products or services.

Action-Oriented Framework: [Action] + [Result/Outcome]
Example: "Take control of your health today." (Fitness gym)
Formula: [Take control action] + [Health outcome]
