# Create EC2 with http server in a new basic VPC 

It creates VPC and EC2 with AWS Cloud Development Kit.

This is to demonstrate:
* How to add user data 
* Extra EBS volume, format and mount
* Fetch latest AMI id
* Some security groups to enable access from internet

# Session manager for ssh access
1. Install binary: `curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/mac/sessionmanager-bundle.zip" -o "sessionmanager-bundle.zip"`
2. Update ~/.ssh/config
```
host i-* mi-*
    ProxyCommand sh -c "/usr/local/bin/aws2 ssm start-session --target %h --document-name AWS-StartSSHSession"
```
3. Login to instance: `ssh -i ~/.ssh/ec2demo.pem ec2-user@INSTANCE_ID` where instance ID is printed in `cdk deploy` 

# Deploy

`cdk deploy`