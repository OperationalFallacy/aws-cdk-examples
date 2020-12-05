import { Context, SQSEvent } from 'aws-lambda';

export const handler = async (event: SQSEvent, context: Context): Promise<any> => {
    console.log("EVENT=%s",JSON.stringify(event), context);
    return "test response";
}
