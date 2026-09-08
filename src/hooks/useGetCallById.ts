import { useEffect, useState } from "react";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";

const useGetCallById = (id: string | string[]) => {
  const [call, setCall] = useState<Call>();
  const [isCallLoading, setIsCallLoading] = useState(true);

  const client = useStreamVideoClient();

  useEffect(() => {
    if (!client) return;

    /**
     * Fetches the call from Stream.io by its ID. If the call exists, sets the
     * call state to the fetched call. If the call does not exist, sets the
     * call state to undefined. If an error occurs, logs the error and sets
     * the call state to undefined. In all cases, sets isCallLoading to false.
     */
    const getCall = async () => {
      try {
        const { calls } = await client.queryCalls({ filter_conditions: { id } });

        if (calls.length > 0) setCall(calls[0]);
      } catch (error) {
        console.error(error);
        setCall(undefined);
      } finally {
        setIsCallLoading(false);
      }
    };

    getCall();
  }, [client, id]);

  return { call, isCallLoading };
};

export default useGetCallById;