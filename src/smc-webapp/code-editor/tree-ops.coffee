###
Binary tree operations
###

immutable = require('immutable')
misc      = require('smc-util/misc')

exports.set = (tree, obj) ->
    id = obj.id
    if not id?  # id must be set
        return tree
    if misc.len(obj) < 2  # nothing to do
        return tree
    done  = false
    process = (node) ->
        if not node? or done
            return node
        if node.get('id') == id
            # it's the one -- change it
            for k, v of obj
                if k != 'id'
                    node = node.set(k, immutable.fromJS(v))
            done = true
            return node
        for x in ['first', 'second'] # binary tree...
            sub0 = node.get(x)
            sub1 = process(sub0)
            if sub0 != sub1 # changed
                node = node.set(x, sub1)
        return node
    return process(tree)

generate_id = ->
    return misc.uuid().slice(0,8)

# Ensure every node of the tree has an id set.
exports.assign_ids = (tree) ->
    process = (node) ->
        if not node?
            return node
        if not node.has('id') or not misc.is_string(node.get('id'))
            return node.set('id', generate_id())
        for x in ['first', 'second'] # binary tree...
            sub0 = node.get(x)
            sub1 = process(sub0)
            if sub0 != sub1 # changed
                node = node.set(x, sub1)
        return node
    return process(tree)

# Ensure ids are unique (changing tree if necessary).
# We assume every node has an id, and that they are all strings.
exports.ensure_ids_are_unique = (tree) ->
    ids = {}
    dupe = false
    process = (node) ->
        if not node?
            return node
        id = node.get('id')
        if ids[id]?
            dupe = true
            return node.set('id', generate_id())
        for x in ['first', 'second'] # binary tree...
            sub0 = node.get(x)
            sub1 = process(sub0)
            if sub0 != sub1 # changed
                node = node.set(x, sub1)
        return node
    while true
        dupe = false
        tree = process(tree)
        if not dupe
            return tree
        # otherwise, sets dupe = false again and runs through it again, generating
        # new random ids when there is a conflict.

