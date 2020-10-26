from crhelper import CfnResource
import logging

logger = logging.getLogger(__name__)
# Initialise the helper, all inputs are optional, this example shows the defaults
helper = CfnResource(json_logging=False, log_level='DEBUG', boto_level='CRITICAL', sleep_on_delete=120)

@helper.create
@helper.update
def create(event, context):
    logger.info("Got create handler!")
    logger.info(f'Request id is: {event["RequestId"]}')
    if (event["ResourceProperties"] == True):
        return 'somestuff'


def main(event, context):
    return {
        'statusCode': 200,
        'body': 'Lambda was invoked successfully.'
    }
