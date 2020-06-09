pragma experimental ABIEncoderV2;
pragma solidity ^0.5.8;

contract geoDonation {
    constructor() public {
    }

    // a structure that holds information for a location and corresponding donation details
    struct registeredLocation {
        address ownerAddress;
        uint goal;
        uint balance;
        string description;
        string owner;
        string coordinate;
        bool exists;
    }

    // map of registeredLocation as value and coordinate as keys
    mapping(string => registeredLocation) locations;

    // array of coordinates of registered location
    string[] latlng_registered;

    // register and post a donation call
    function register(string memory _coordinate, string memory _owner, string memory _description, uint _goal) public {
        // creates empty registeredLocation struct
        registeredLocation memory c = registeredLocation(msg.sender, _goal, 0, _description, _owner, _coordinate, true);
        // add this struct to the locations mapping
        locations[_coordinate] = c;
        // record the coordinates and push it to the array
        latlng_registered.push(_coordinate);
    }

    // donate money to a location upon checking if the location is registered
    function donate(uint amount, string memory latlng) public {
        assert(locations[latlng].exists);
        locations[latlng].balance += amount;
    }

    // not used yet
    function getOwnerInfo(string memory latlng) public view returns (string memory) {
        return locations[latlng].owner;
    }

    // returns how much is donated to a location
    function getBalance(string memory latlng) public view returns (uint) {
        return locations[latlng].balance;
    }

    // returns array of coordinates
    function getCoordinates() public view returns (string[] memory) {
        return latlng_registered;
    }

    // not used yet
    // when retrieving the donation money, check if the function caller is the owner of this donation post
    // function isOwner(string memory _coordinate) public view returns (bool) {
    //     if (locations[_coordinate].ownerAddress == msg.sender)
    //         return true;
    // }
}
