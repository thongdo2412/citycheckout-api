# Net Worth API

Backend API for Net Worth service.

[Slack Channel](https://join.slack.com/t/nnetworth/shared_invite/enQtMjQxNjU3NDQ2NzA0LTc2NzUwZmMzODQ5MjQzYTY0OGFiMjQ4YTYzYjJiMWE0Nzk3NWE2NjUyNzU1NTMyZTdhYTJiNjMwN2YyMjM3Mjg)

## Installation
This project requires NodeJS v6 and up

```shell
# install yarn
npm install -g yarn

# install sam-local, it requires Docker, read their installation instruction:
# https://github.com/awslabs/aws-sam-local#installation
yarn global add aws-sam-local

# install awscli
sudo pip install awscli

# configure aws cli
# ping Kien @kienpham2000 for access to a shared AWS cred for now
# region is: us-east-1, default output is: json
aws configure

# install packages
yarn
```

## Start Service

Start a local Lambda Docker

```shell
# start the local Lambda
yarn watch

# get the Net Worth number!
curl localhost:3000/networth
```

## Testing

```shell
# lint
yarn lint

# test
yarn test
```

## Debug

Tail live CloudWatch log

```shell
yarn tail
```
