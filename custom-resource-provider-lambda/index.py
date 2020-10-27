from crhelper import CfnResource
import logging
import json
import boto3

logger = logging.getLogger(__name__)
# Initialise the helper, all inputs are optional, this example shows the defaults
helper = CfnResource(json_logging=False, log_level='DEBUG', boto_level='CRITICAL', sleep_on_delete=120)
cfClient = boto3.client('cloudformation')

CUSTOM_RESOURCE_PROP_TO_CHECK = "BranchToTrackForAppSource"

@helper.create
def create(event, context):
    logger.info("Got create handler!")
    logger.info(f'Request id is: {event["RequestId"]}')
    try:
        with open('PipelineDeployingLambdaStack.template.json') as pipelineTemplate:
            if (("ResourceProperties" in event) and CUSTOM_RESOURCE_PROP_TO_CHECK in event['ResourceProperties']):
                logger.info(f'branch to track will be: {event["ResourceProperties"][CUSTOM_RESOURCE_PROP_TO_CHECK]}')
                response = cfClient.create_stack(
                    StackName='PipelineDeployingLambdaStack',
                    TemplateBody=json.dumps(json.load(pipelineTemplate)),
                    Parameters=[
                        {
                            'ParameterKey': 'BranchToTrackForAppSource',
                            'ParameterValue': event["ResourceProperties"][CUSTOM_RESOURCE_PROP_TO_CHECK]
                        },
                    ],
                    TimeoutInMinutes=13,
                    Capabilities=[
                        'CAPABILITY_NAMED_IAM',
                    ]
                )
                return response['StackId']
            else:
                raise RuntimeError(f'{CUSTOM_RESOURCE_PROP_TO_CHECK} property not present. Instead found: {event["ResourceProperties"]}')
    except OSError as identifier:
        raise RuntimeError(f"could not read file because: {identifier.strerror}")


@helper.update


@helper.delete
def delete(event, context):
    # We do nothing for now.
    return

def main(event, context):
    helper(event, context)
