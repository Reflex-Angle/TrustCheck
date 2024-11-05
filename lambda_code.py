import os
import io
import boto3
import json
import csv

# grab environment variables
ENDPOINT_NAME = os.environ['ENDPOINT_NAME']
runtime= boto3.client('runtime.sagemaker')

#test should be json of format {'text':'sentiment'}
def lambda_handler(event, context):
    # TODO implement
    if 'body' in event:
        input_text = json.loads(event['body']).get("text")
    else:
        input_text = event.get("text")

    # Construct payload for SageMaker model
    payload = {
        "inputs": input_text
    }
    payload_str = json.dumps(payload)
    response = runtime.invoke_endpoint(EndpointName=ENDPOINT_NAME,
                                      ContentType='application/json',
                                      Body=payload_str)
    response_body = response['Body'].read().decode()
    result = json.loads(response_body)

    # Extract the 'label' value
    label_value = result[0]["label"]  # Adjust "label" to match the actual key name in the response
    
    # Prepare the response dictionary with just the label value
    preds = {"Prediction": label_value}
    response_dict = {
          "statusCode": 200,
          "body": json.dumps(preds)
                }
    return response_dict


#add this to lambda permissions 
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "sagemaker:InvokeEndpoint",
            "Resource": "*"
        }
    ]
}
