from langchain.chains.llm import LLMChain
from langchain.prompts import PromptTemplate
from langchain_community.llms.openai import OpenAI

import os

def generate_learning_plan(goal: str):
    template = """
    You are a personal learning assistant. Generate a 30-day learning plan for the following goal:
    Goal: {goal}
    Provide a day-by-day breakdown with topics, resources, and activities.
    """
    prompt = PromptTemplate(template=template, input_variables=["goal"])
    llm = OpenAI(api_key=os.environ['OPEN_AI_KEY'])
    chain = LLMChain(llm=llm, prompt=prompt)
    return chain.run(goal)