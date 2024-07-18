# Contributing to WorkflowAI

First off, thank you for considering contributing to WorkflowAI! Contributions are essential for the growth and improvement of the project. We appreciate your efforts and want to make it as easy as possible for you to contribute.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
    - [Reporting Bugs](#reporting-bugs)
    - [Suggesting Enhancements](#suggesting-enhancements)
    - [Pull Requests](#pull-requests)
3. [Development Workflow](#development-workflow)
4. [Style Guides](#style-guides)

## Code of Conduct

This project and everyone participating in it is governed by the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [info@franciscobaptista.com].

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please report it by following these steps:

1. **Search for similar issues**: It's possible that the issue has already been reported. If you find an existing issue, feel free to add a comment with your findings.
2. **Open a new issue**: If you do not find an existing issue, create a new one. Use a clear and descriptive title and provide as much relevant information as possible:
    - Steps to reproduce the bug
    - Expected and actual results
    - Screenshots, if applicable
    - Any other relevant information (e.g., environment, versions)

### Suggesting Enhancements

We welcome suggestions to improve WorkflowAI. To suggest an enhancement:

1. **Search for similar suggestions**: There might be an existing suggestion that you can contribute to.
2. **Open a new issue**: If you do not find a similar suggestion, create a new issue. Use a clear and descriptive title and explain your suggestion in detail. Include any benefits or potential drawbacks.

### Pull Requests

We love pull requests! If you have a fix, feature, or improvement, please follow these guidelines:

1. **Fork the repository** and create your branch from `main`.
2. **Describe your changes**: Clearly describe the problem and the solution in the PR description.
3. **Include tests**: If applicable, add tests to ensure your change works as expected.
4. **Update documentation**: If applicable, update the documentation to reflect your changes.
5. **Submit your pull request**: After following these steps, submit your pull request. Our team will review it as soon as possible.

## Development Workflow

### Local Setup

1. **Clone the repository**:
    ```sh
    git clone https://github.com/yourusername/WorkflowAI.git
    cd WorkflowAI
    ```

2. **Install dependencies using Bun**:
    ```sh
    bun install
    ```

3. **Set up environment variables**:
    Create a `.env` file in the root directory and add the following environment variables:
    ```
    OPENAI_API_KEY=your_openai_api_key_here
    WORKFLOW_BASE_DIR=/absolute/path/to/WorkflowAI
    ```

### Running Tests

To run tests, use the following command:
```sh
bun test
```

### Building the Project

To build the project:
```sh
bun run build
```

## Style Guides

### Commit Messages

- Use clear and descriptive commit messages.
- Reference relevant issues or PRs.
- Example:
    ```
    Fix issue with file reading logic

    This commit addresses issue #123 by updating the file reading logic to handle edge cases.
    ```

### Code Style

- Follow the coding style and conventions used in the project.
- Ensure your code is clean, well-structured, and properly documented.

### Documentation

- Update the documentation for any changes in functionality.
- Use clear and concise language.

## Additional Resources

- [Contributor Covenant](https://www.contributor-covenant.org/) - A code of conduct for open source communities
- [Bun Documentation](https://bun.sh/docs) - Learn more about Bun and its features

Thank you for your contributions and for making WorkflowAI better! If you have any questions or need further assistance, feel free to reach out to the maintainers at [info@franciscobaptista.com].
