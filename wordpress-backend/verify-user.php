<?php
/**
 * Plugin Name: Fitness App API - Verify User
 * Description: Custom REST API endpoint to verify user subscription via PMPro by email or mobile number.
 * Version: 1.1
 * Author: Abhimanyu Sharma
 */

// Block direct access
if (!defined('ABSPATH')) {
    exit;
}

// Register the custom REST route
add_action('rest_api_init', 'fitness_app_register_verify_user_route');

function fitness_app_register_verify_user_route() {
    register_rest_route('fitness-app/v1', '/verify-user', array(
        'methods'             => 'POST',
        'callback'            => 'fitness_app_verify_user_endpoint',
        'permission_callback' => 'fitness_app_verify_user_permissions_check', // You can implement a proper API key check here
        // Define args to enforce validation before the callback runs
        'args'                => array(
            'login_id' => array(
                'required'          => true,
                'validate_callback' => function ($param, $request, $key) {
                    return !empty($param) && is_string($param);
                },
                // Sanitize as text field. If it's an email, we'll validate it inside the callback
                'sanitize_callback' => 'sanitize_text_field'
            )
        )
    ));
}

// Basic permission check (allow public access or implement custom auth like API key header)
function fitness_app_verify_user_permissions_check($request) {
    /* 
     * Example: check for a custom header to secure this endpoint from abuse.
     * $api_key = $request->get_header('x-fitness-api-key');
     * if ($api_key !== 'YOUR_SECRET_API_KEY') {
     *     return new WP_Error('rest_forbidden', 'Invalid API key.', array('status' => 401));
     * }
     */
    return true; 
}

// The main callback function
function fitness_app_verify_user_endpoint($request) {
    // 1. Get and sanitize the input
    $login_id = $request->get_param('login_id');

    $user_id = 0;

    // 2. Check if the login_id is an email
    if (is_email($login_id)) {
        $user = get_user_by('email', $login_id);
        if ($user) {
            $user_id = $user->ID;
        }
    } else {
        // Not an email, so we assume it's a mobile number.
        // Query WP users by the 'mobile_number' meta key.
        // Note: Adjust the 'meta_key' value if your system stores it under a different name (e.g., 'billing_phone')
        $users = get_users(array(
            'meta_key'   => 'mobile_number',
            'meta_value' => $login_id,
            'number'     => 1, // We only need the first matched user
            'orderby'    => 'ID',
            'order'      => 'ASC'
        ));

        if (!empty($users)) {
            $user = $users[0];
            $user_id = $user->ID;
        }
    }

    // 3. Handle User Not Found
    if (!$user_id) {
        return new WP_Error(
            'user_not_found',
            'No user found with the provided email or mobile number.',
            array('status' => 404)
        );
    }

    // 4. Verify Active Subscription with PMPro
    if (!function_exists('pmpro_hasMembershipLevel')) {
        return new WP_Error(
            'pmpro_missing',
            'Paid Memberships Pro plugin is not active on the server.',
            array('status' => 500)
        );
    }

    // Checking if they have *any* active membership level
    $has_active_subscription = pmpro_hasMembershipLevel(0, $user_id);
    
    // Get ALL membership levels for debugging
    $all_levels = function_exists('pmpro_getMembershipLevelsForUser') ? pmpro_getMembershipLevelsForUser($user_id) : 'pmpro_getMembershipLevelsForUser not found';

    // 5. Return success or forbidden response
    if ($has_active_subscription) {
        $user_obj = get_userdata($user_id);
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'User has an active subscription.',
            'data'    => array(
                'user_id'      => $user_id,
                'display_name' => $user_obj->display_name,
                'email'        => $user_obj->user_email,
                'first_name'   => $user_obj->first_name,
                'last_name'    => $user_obj->last_name,
                'levels'       => $all_levels
            )
        ));
    } else {
        return new WP_Error(
            'forbidden',
            'User does not have an active subscription for any required level.',
            array(
                'status' => 403, 
                'debug_user_id' => $user_id,
                'debug_levels' => $all_levels 
            )
        );
    }
}
