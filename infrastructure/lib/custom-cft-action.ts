import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';

export class VariableExposedCloudFormationCreateUpdateStackAction extends codepipeline_actions.CloudFormationCreateUpdateStackAction {
    constructor(props: codepipeline_actions.CloudFormationCreateUpdateStackActionProps) {
        super(props);
    }

    public retireveNamespaceVariable(variableKey: string) {
        return this.variableExpression(variableKey)
    }
}