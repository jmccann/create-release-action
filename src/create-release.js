const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');

async function run() {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const github = new GitHub(process.env.GITHUB_TOKEN);

    // Get owner and repo from context of payload that triggered the action: https://help.github.com/en/github/automating-your-workflow-with-github-actions/events-that-trigger-workflows
    const { owner, repo } = context.repo;

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const releaseName = core.getInput('release_name', { required: true }).replace('refs/tags/', '');
    const draft = core.getInput('draft', { required: false }) === 'true';
    const prerelease = core.getInput('prerelease', { required: false }) === 'true';
    const tagName = core.getInput('tag_name', { required: true });
    const body = core.getInput('body', { required: false });

    // This removes the 'refs/tags' portion of the string, i.e. from 'refs/tags/v1.10.15' to 'v1.10.15'
    const tag = tagName.replace('refs/tags/', '');

    // Create a release
    // API Documentation: https://developer.github.com/v3/repos/releases/#create-a-release
    // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-create-release
    const createReleasePayload = {
      owner,
      repo,
      tag_name: tag,
      name: releaseName,
      draft,
      prerelease
    };
    if (body != '') {
      createReleasePayload.body = body;
    }

    const createReleaseResponse = await github.repos.createRelease(createReleasePayload);

    // Get the ID, html_url, and upload URL for the created Release from the response
    const {
      data: { id: releaseId, html_url: htmlUrl, upload_url: uploadUrl }
    } = createReleaseResponse;

    // Set the output variables for use by other actions: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    core.setOutput('id', id);
    core.setOutput('html_url', html_url);
    core.setOutput('upload_url', uploadUrl);
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;
