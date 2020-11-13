import { expect, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import *  cdk from '@aws-cdk/core';
import * as S3Sqs from '../lib/s3-sqs-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new S3Sqs.S3SqsStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
