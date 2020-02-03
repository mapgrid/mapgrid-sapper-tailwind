<script>
	export let segment;
</script>

<style>
	ul {
		@apply flex p-4;
	}

	li {
		@apply mr-6;
	}

	a {
		@apply text-blue-500;
	}

	a:hover {
		@apply text-blue-800;
	}

	a.selected {
		@apply underline;
	}
</style>

<nav>
<ul>
  <li>
    <a class:selected='{segment === undefined}' href=".">home</a>
  </li>
  <li>
    <a class:selected='{segment === "about"}' href="about">about</a>
  </li>
</ul>
</nav>
