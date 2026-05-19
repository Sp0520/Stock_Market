<?php
/**
 * Case-insensitive dictionary, suitable for HTTP headers
 *
 * @package Requests
 * @subpackage Utilities
 */

/**
 * Case-insensitive dictionary, suitable for HTTP headers
 *
 * @package Requests
 * @subpackage Utilities
 */
class Requests_Utility_CaseInsensitiveDictionary implements ArrayAccess, IteratorAggregate {
	/**
	 * Actual item data
	 *
	 * @var array
	 */
	protected $data = array();

	/**
	 * Check if the given item exists
	 *
	 * @param string $key Item key
	 * @return boolean Does the item exist?
	 */
	public function offsetExists(mixed $key): bool {
		$key = strtolower((string) $key);
		return isset($this->data[$key]);
	}

	/**
	 * Get the value for the item
	 *
	 * @param string $key Item key
	 * @return string|null Item value
	 */
	public function offsetGet(mixed $key): mixed {
		$key = strtolower((string) $key);
		if (!isset($this->data[$key]))
			return null;

		return $this->data[$key];
	}

	/**
	 * Set the given item
	 *
	 * @throws Requests_Exception On attempting to use dictionary as list (`invalidset`)
	 *
	 * @param string|null $key Item name
	 * @param mixed $value Item value
	 */
	public function offsetSet(mixed $key, mixed $value): void {
		if ($key === null) {
			throw new Requests_Exception('Object is a dictionary, not a list', 'invalidset');
		}

		$key = strtolower((string) $key);
		$this->data[$key] = $value;
	}

	/**
	 * Unset the given header
	 *
	 * @param string $key
	 */
	public function offsetUnset(mixed $key): void {
		unset($this->data[strtolower((string) $key)]);
	}

	/**
	 * Get an iterator for the data
	 *
	 * @return ArrayIterator
	 */
	public function getIterator(): \Traversable {
		return new ArrayIterator($this->data);
	}

	/**
	 * Get the headers as an array
	 *
	 * @return array Header data
	 */
	public function getAll() {
		return $this->data;
	}
}
