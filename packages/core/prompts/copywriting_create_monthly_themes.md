---
id: create_monthly_themes
description: Generate for a given audience and community a lis of 12 monthly themes that will engage the community throughout the year.
temperature: 0.7
maxTokens: 4096
---


You are tasked with creating a framework to generate ideas for monthly themes for a community. These themes should provide novelty, keep conversations fresh and interesting, and align with the community's goals. Your task is to analyze the given information and create a list of 12 monthly themes that will engage the community throughout the year.

First, carefully read and analyze the following information about the community:

<community_description>
{{COMMUNITY_DESCRIPTION}}
</community_description>

<target_audience>
{{TARGET_AUDIENCE}}
</target_audience>

<community_goals>
{{COMMUNITY_GOALS}}
</community_goals>

Now, follow these steps to generate monthly themes:

1. Analyze the community information:
   - Identify key topics, interests, and challenges relevant to the community
   - Consider the skill levels and backgrounds of the target audience
   - Note any specific areas of focus mentioned in the community goals

2. Consider calendar events and seasons:
   - Think about major holidays, industry events, or seasonal changes that might be relevant to the community
   - Incorporate these events into your theme ideas where appropriate

3. Brainstorm theme ideas:
   - Generate a list of potential themes that align with the community's interests and goals
   - Ensure themes are broad enough to sustain discussions for a full month
   - Create themes that allow for sharing stories, experiences, and ideas

4. Align themes with community goals:
   - Review your list of themes and ensure they contribute to the community's overall objectives
   - Adjust or replace themes that don't clearly support the stated goals

5. Create a cohesive yearly plan:
   - Arrange the themes in a logical order that creates a sense of progression throughout the year
   - Consider starting with goal-setting or planning themes in January
   - End the year with reflection or celebration themes in December

Once you have completed these steps, provide your output in the following format:

<monthly_themes>
1. January: [Theme Name] - [Brief description]
2. February: [Theme Name] - [Brief description]
...
12. December: [Theme Name] - [Brief description]
</monthly_themes>

<theme_rationale>
Provide a brief explanation of how these themes align with the community's goals and cater to the target audience. Discuss any specific considerations or strategies you used in creating this yearly plan.
</theme_rationale>

Here's an example of how your output should look:

<monthly_themes>
1. January: Goal Setting Extravaganza - Kick off the year by helping members set achievable goals aligned with their passions
2. February: Love Your Craft - Explore ways to deepen appreciation and skills in our shared interest
...
12. December: Reflect and Celebrate - Look back on the year's achievements and plan for future growth
</monthly_themes>

<theme_rationale>
These themes were designed to support the community's goal of [specific goal] by focusing on [key areas]. The progression from goal-setting in January to reflection in December creates a natural yearly cycle. Themes like [example theme] and [example theme] directly address the target audience's interest in [specific interest]. Calendar events such as [holiday/event] were incorporated into [month] theme to add relevance and timeliness.
</theme_rationale>

Remember to tailor your themes specifically to the given community description, target audience, and goals. Be creative and think about how each theme can provide value and engagement to the community members throughout the year.
