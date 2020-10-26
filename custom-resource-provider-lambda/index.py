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
    if (event["ResourceProperties"]["AddBucket"] == True):
        return 'somestuff'
    elif (event["ResourceProperties"]["AddBucket"] == False):
        return 'someotherstuffstuff'
    else:
        raise RuntimeError("Something went wrong")

@helper.delete
def delete(event, context):
    # We do nothing for now.
    return

def main(event, context):
    helper(event, context)
