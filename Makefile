TAG = 731272683352.dkr.ecr.us-east-1.amazonaws.com/deskradar-services/clients-api:latest

build:
	docker build -t deskradar-services/clients-api .

tag:
	docker tag deskradar-services/clients-api:latest $(TAG)

push:
	docker push $(TAG)
