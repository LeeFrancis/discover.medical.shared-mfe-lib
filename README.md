# discover.medical.shared-mfe-lib
Extract Micro Front-End components to a shared library that all projects can use. 

## Versioning Recommendations/Guidelines
Reference: https://nodejs.dev/semantic-versioning-using-npm

Node js follows a semantic versioning and that means MajorVersion.MinorVersion.Patch

Some recommendations for release are are, 
1. Up the major version when making incompatible API changes
2. Up the minor version when adding functionality in a backward-compatible manner
3. Up the patch version when making backward-compatible bug fixes

The recommendations for using this library in your project is as follows.
1. Use the '~' operator so it stays in the current minor patch version
2. Always update the minor version with a patch version of '0' when starting to develop and building it out for testing, See Alternate section for testing locally before needing to build out.
3. Each subsequent changes that needs to be build out to artifactory will have the patch version incremented with the minor version be constant. eg. 2.1.0 -> 2.1.1. This is to keep up with the semantic versioning as patches that fix bugs only update the patch version. DO NOT UPDATE the minor version unless additional functionality is added.
4. If its a breaking change, then update the Major version for testing it by building out to artifactory.