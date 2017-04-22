# workspace

`npm install -g workspace`

This command line utility makes container-based workflow easy. Currently,
only Docker is supported. Docker must be installed on your local workstation.
This is freely available for [macOS](https://www.docker.com/docker-mac) and
[Windows](https://www.docker.com/docker-windows).

The `workspace` command has a shorthand alias of `ws` for those who want to
type less.  

## Create a Workspace

To create a workspace, run `workspace init`. This launches a wizard to walk
through the basic setup.

## Using a Workspace

Running a workspace is the default command for the utility, so just run
`workspace` from the project's root directory. It will also respond
to `workspace start`.

## Building a Workspace

There are situations where a workspace needs to be rebuilt. Typically this
is done directly with a `docker build -t registry.mydomain.com/repo/<image> .` command. However; running `workspace build` or `workspace rebuild` will
do this for you.

While this may seem like a little detail, it is actually a helpful time saver.
Often times, application code residing in a directory (such as `/app`) is
mounted to a Docker image. As one navigates throughout complex project
directory hierarchies, it's easy to run the build command from the wrong
directory, which throws an error. Building with `workspace` will always use
the project root as it's working directory, meaning it maintains context all
the time.

## Configure a Workspace

A `.workspace.yml` file may exist in the project root, containing metadata
for the individual project.
