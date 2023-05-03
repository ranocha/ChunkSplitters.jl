var documenterSearchIndex = {"docs":
[{"location":"#ChunkSplitters.jl","page":"Home","title":"ChunkSplitters.jl","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"ChunkSplitters facilitate the splitting of the workload of parallel jobs independently on the number of threads that are effectively available. It allows for a finer, lower level, control of the load of each task.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The way chunks are indexed is also recommended for guaranteeing that the workload if completely thread safe  (without the use threadid() - see here). ","category":"page"},{"location":"","page":"Home","title":"Home","text":"A discussion on the possible use of ChunkSplitters to improve load-balancing is available here.","category":"page"},{"location":"#Installation","page":"Home","title":"Installation","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Install with:","category":"page"},{"location":"","page":"Home","title":"Home","text":"julia> import Pkg; Pkg.add(\"ChunkSplitters\")","category":"page"},{"location":"#The-chunks-iterator","page":"Home","title":"The chunks iterator","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The main interface is the chunks iterator:","category":"page"},{"location":"","page":"Home","title":"Home","text":"chunks(array::AbstractArray, nchunks::Int, type::Symbol=:batch)","category":"page"},{"location":"","page":"Home","title":"Home","text":"This iterator returns a Tuple{UnitRange,Int} with the range of indices of array to be iterated for each given chunk. If type == :batch, the ranges are consecutive. If type == :scatter, the range is scattered over the array. ","category":"page"},{"location":"","page":"Home","title":"Home","text":"The chunking types are illustrated in the figure below: ","category":"page"},{"location":"","page":"Home","title":"Home","text":"(Image: splitter types)","category":"page"},{"location":"","page":"Home","title":"Home","text":"In the :batch type, the tasks are associated to each thread until the fraction of the workload of that thread is  complete. In the :scatter type, the tasks are assigned in an alternating fashion. If the workload is uneven and correlated with its position in the input array, the :scatter option will be more efficient. ","category":"page"},{"location":"#Examples","page":"Home","title":"Examples","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"julia> using ChunkSplitters \n\njulia> x = rand(7);\n\njulia> Threads.@threads for (xrange,ichunk) in chunks(x, 3, :batch)\n           @show (xrange, ichunk)\n       end\n(xrange, ichunk) = (1:3, 1)\n(xrange, ichunk) = (6:7, 3)\n(xrange, ichunk) = (4:5, 2)\n\njulia> Threads.@threads for (xrange,ichunk) in chunks(x, 3, :scatter)\n           @show (xrange, ichunk)\n       end\n(xrange, ichunk) = (2:3:5, 2)\n(xrange, ichunk) = (1:3:7, 1)\n(xrange, ichunk) = (3:3:6, 3)","category":"page"},{"location":"","page":"Home","title":"Home","text":"If the third argument is ommitted (i. e. :batch or :scatter), the default :batch option is used.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Now, we illustrate the use of the iterator in a practical example:","category":"page"},{"location":"","page":"Home","title":"Home","text":"julia> using ChunkSplitters\n\njulia> function sum_parallel(f, x; nchunks=Threads.nthreads())\n           s = fill(zero(eltype(x)), nchunks)\n           Threads.@threads for (xrange, ichunk) in chunks(x, nchunks)\n               for i in xrange\n                  s[ichunk] += f(x[i])\n               end\n           end\n           return sum(s)\n       end\nsum_parallel (generic function with 1 methods)\n\njulia> x = rand(10^7);\n\njulia> Threads.nthreads()\n12\n\njulia> @btime sum(x -> log(x)^7, $x)\n  115.026 ms (0 allocations: 0 bytes)\n-5.062317099586189e10\n\njulia> @btime sum_parallel(x -> log(x)^7, $x; nchunks=4)\n  40.242 ms (77 allocations: 6.55 KiB)\n-5.062317099581316e10\n\njulia> @btime sum_parallel(x -> log(x)^7, $x; nchunks=12)\n  33.723 ms (77 allocations: 6.61 KiB)\n-5.062317099584852e10\n\njulia> @btime sum_parallel(x -> log(x)^7, $x; nchunks=64)\n  22.105 ms (77 allocations: 7.02 KiB)\n-5.062317099585973e10","category":"page"},{"location":"","page":"Home","title":"Home","text":"Note that it is possible that nchunks > nthreads() is optimal, since that will distribute the workload more evenly among available threads.","category":"page"},{"location":"#Lower-level-chunks-function","page":"Home","title":"Lower-level chunks function","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The package also provides a lower-level chunks function:","category":"page"},{"location":"","page":"Home","title":"Home","text":"chunks(array::AbstractArray, ichunk::Int, nchunks::Int, type::Symbol=:batch)","category":"page"},{"location":"","page":"Home","title":"Home","text":"that returns a range of indexes of array, given the number of chunks in which the array is to be split, nchunks, and the current chunk number ichunk. ","category":"page"},{"location":"#Example","page":"Home","title":"Example","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The example shows how to compute a sum of a function applied to the elements of an array, and the effect of the parallelization and the number of chunks in the performance:","category":"page"},{"location":"","page":"Home","title":"Home","text":"julia> using ChunkSplitters: chunks\n\njulia> function sum_parallel(f, x; nchunks=Threads.nthreads())\n           s = fill(zero(eltype(x)), nchunks)\n           Threads.@threads for ichunk in 1:nchunks\n               for i in chunks(x, ichunk, nchunks)\n                   s[ichunk] += f(x[i])\n               end\n           end\n           return sum(s)\n       end\nsum_parallel (generic function with 2 methods)\n\njulia> x = rand(10^7);\n\njulia> Threads.nthreads()\n12\n\njulia> @btime sum(x -> log(x)^7, $x)\n  122.085 ms (0 allocations: 0 bytes)\n-5.062317099586189e10\n\njulia> @btime sum_parallel(x -> log(x)^7, $x; nchunks=4)\n  45.802 ms (74 allocations: 6.61 KiB)\n-5.062317099581316e10\n\njulia> @btime sum_parallel(x -> log(x)^7, $x; nchunks=12)\n  33.963 ms (74 allocations: 6.67 KiB)\n-5.062317099584852e10\n\njulia> @btime sum_parallel(x -> log(x)^7, $x; nchunks=64)\n  22.999 ms (74 allocations: 7.08 KiB)\n-5.062317099585973e10","category":"page"},{"location":"#Examples-of-different-splitters","page":"Home","title":"Examples of different splitters","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"For example, if we have an array of 7 elements, and the work on the elements is divided into 3 chunks, we have (using the default type = :batch option):","category":"page"},{"location":"","page":"Home","title":"Home","text":"julia> using ChunkSplitters\n\njulia> x = rand(7);\n\njulia> chunks(x, 1, 3)\n1:3\n\njulia> chunks(x, 2, 3)\n4:5\n\njulia> chunks(x, 3, 3)\n6:7","category":"page"},{"location":"","page":"Home","title":"Home","text":"And using type = :scatter, we have:","category":"page"},{"location":"","page":"Home","title":"Home","text":"julia> chunks(x, 1, 3, :scatter)\n1:3:7\n\njulia> chunks(x, 2, 3, :scatter)\n2:3:5\n\njulia> chunks(x, 3, 3, :scatter)\n3:3:6","category":"page"}]
}