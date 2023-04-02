import chalkPipe from 'chalk-pipe';
import { program } from 'commander';
import { config } from 'dotenv';
import inquirer from 'inquirer';
import { Configuration, OpenAIApi } from 'openai';
config();

const getChatResponse = async (openAI: OpenAIApi, content: any) => {

  let response = null;

  try {

    response = await openAI.createChatCompletion({

      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: content
      }]
    });
  }
  catch (error) {
    console.log(error);
  }

  return response;
}

(async () => {

  let apiKey;
  let answers;

  program
    .name('chatgpt-poc')
    .description('CLI to ChatGPT 3.5 APIs')
    .version('0.0.1')
    .command('chat')
    .description('Ask questions to ChatGPT')
    .requiredOption('-k, --api-key <key>', 'API key to use', process.env.CHATGPT_API_KEY)
    .action((options) => {
      apiKey = options.apiKey;
    });

  program.parse();

  const openAI = new OpenAIApi(new Configuration({
    apiKey: apiKey
  }))

  do {
    try {
      answers = await inquirer.prompt([{
        type: 'input',
        name: 'question',
        message: chalkPipe('blue.bold')('Question:')
      }]);

      const response = await getChatResponse(openAI, answers.question);

      console.log('Answers: ');
      for (const choice of response?.data.choices ?? []) {
        console.log(`Answer ${choice.index}: ${choice.message?.content}`);
      }

      console.log('------');
      console.log('Total Usage: ', response?.data.usage?.total_tokens);

      answers = await inquirer.prompt([{
        type: 'confirm',
        name: 'continue',
        message: chalkPipe('blue.bold')('Continue:')
      }]);
    }
    catch (error) {
      console.log(error);
    }
  } while (answers.continue);
})()
