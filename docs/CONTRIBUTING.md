# Contributing

We welcome contributions to `html-content-processor`!

## Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## Development Setup

```bash
git clone https://github.com/your-username/html-content-processor.git
cd html-content-processor
npm install
npm run build
npm test
```

## Code Standards

### TypeScript
- Use TypeScript for all new code
- Follow existing code style
- Add JSDoc comments for public APIs
- Keep functions focused and small

### Testing
- Write tests for new features
- Test both Node.js and browser environments
- Ensure all tests pass: `npm test`
- Add URLs to test suite for new page types

### Documentation
- Update README.md for new features
- Update API examples in docs/
- Add inline comments for complex logic

## Pull Request Process

1. **Describe your changes** clearly
2. **Update documentation** if needed
3. **Add tests** for new functionality
4. **Ensure CI passes** (build + tests)
5. **Keep commits focused** and descriptive

## Reporting Issues

Include:
- **Clear description** of the problem
- **Steps to reproduce** with code examples
- **Expected vs actual behavior**
- **Environment details** (Node.js/browser version)

## Feature Requests

Consider:
- **Use case** and benefits
- **Backward compatibility**
- **Performance impact**
- **Implementation complexity**

## Areas for Contribution

### Page Type Detection
- Add new page type detection rules
- Improve detection accuracy
- Add test URLs for new page types

### Core Functionality
- Enhance HTML filtering algorithms
- Improve Markdown conversion quality
- Add new presets for specific content types

### Documentation
- Improve API examples
- Add use case guides
- Translate documentation

### Testing
- Add more test cases
- Improve test coverage
- Add performance benchmarks

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Open an issue or discussion for any questions about contributing! 