# Example of CDK in Javascript

This is project deploys AWS Codepipeline that deploys CDK app to create some infra: s3 bucket with sqs notifications.

It is using basic CDK constructs.

## Development

`cd node/s3-sqs`
`npm install`
`npx cdk diff PipelineStack`

AWS Codepipeline is created, it runs, updates itself and deployes application.

Following pushes to branch will trigger this pipeline. 


## Useful commands
 * `cdk metadata S3SqsStack` list resources
 * `npm run test`         perform the jest unit tests
 * `cdk deploy`           deploy this stack to your default AWS account/region
 * `cdk diff`             compare deployed stack with current state
 * `cdk synth`            emits the synthesized CloudFormation template

## TODO

Fix tests...