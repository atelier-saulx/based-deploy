# Based.io Deploy

Deploy your branch easily in your Based.io account using this GitHub Action.

## Inputs

### `userID` (as an 'env' variable)

**Required** The user ID created on the Based.io dashboard.

### `apiKey` (as an 'env' variable)

**Required** The secret token for authentication with the Based.io API.

### `size` (as input parameter)

**Not Required** The size of the environment, can be 'small' or 'large'. The default is 'small'.

### `region` (as input parameter)

**Not Required** In which region would you like to spawn the environment? You can choose between 'eu-central-1', 'sa-east-1', 'us-east-1', 'us-west-1', 'ap-southeast-2'. The default is 'eu-central-1'.

## Outputs

### `response`

A Success/Error message containing the Based CLI output. 

## Example usage
* Login into your account at Based.io dashboard. After to create your first organization (in this case 'github-actions'), click on 'New Project' and choose a name (in this case 'demo') and create your first environment.

<img src="https://raw.githubusercontent.com/atelier-saulx/based-deploy/main/steps/step1.png" width="800" />

* Go to 'Settings' and click on your organization's name and then click on 'Service accounts'. After click on 'Create new service account'.
  
<img src="https://raw.githubusercontent.com/atelier-saulx/based-deploy/main/steps/step2.png" width="800" />

* Give a name to your service account and select a role to your project. You can choose between 'admin' and 'viewer' (in this case, you need to set 'admin'), check the option 'Organization admin', and then click on 'Create service account'.

<img src="https://raw.githubusercontent.com/atelier-saulx/based-deploy/main/steps/step3.png" width="500" />

* You'll see your User ID and the API key. Pay attention you can only see this information once, so click on both to copy to your clipboard and store safely this information and then click on Exit.
  
<img src="https://raw.githubusercontent.com/atelier-saulx/based-deploy/main/steps/step4.png" width="500" />

* Your dashboard will update with your new service account created. Now you can use this action passing the information to the workflow.
* Note that you must use 'userID' and 'apiKey' as the env's variable's names.

```yaml
    uses: atelier-saulx/based-deploy@v1.2.32
    with:
      userID: ${{ secrets.BASED_USER_ID }}
      apiKey: ${{ secrets.BASED_API_KEY }}
      size: small
      region: eu-central-1