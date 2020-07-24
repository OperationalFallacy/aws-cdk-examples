# Example of CDK in Javascript

This is project deploys s3 bucket with sqs notifications using basic CDK constructs.

## Development

`cd node/s3-sqs`
`npm install`
`cdk deploy`

## Useful commands
 * `cdk metadata S3SqsStack` list resources
 * `npm run test`         perform the jest unit tests
 * `cdk deploy`           deploy this stack to your default AWS account/region
 * `cdk diff`             compare deployed stack with current state
 * `cdk synth`            emits the synthesized CloudFormation template

## TODO

Fix tests...